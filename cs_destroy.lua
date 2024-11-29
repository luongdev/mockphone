local channel_uuid = event:getHeader('Unique-ID') or '';
local call_uuid = event:getHeader('Channel-Call-UUID') or '';

if channel_uuid == '' or call_uuid == '' then return; end

local Database = require 'resources.functions.database';
local switch = Database.new('switch');

if not switch then
  freeswitch.consoleLog('ERR', 'Cannot found dbh for [switch] clear' .. "\n");
  return;
end

function handle_cancel()
  local cname = event:getHeader('Channel-Name') or '';
  local hup_cause = event:getHeader('Hangup-Cause') or 'NORMAL_CLEARING';

  if string.sub(cname, 1, 7) == 'pickup/' and (hup_cause == 'ORIGINATOR_CANCEL' or hup_cause == 'ALLOTTED_TIMEOUT') then

    require 'base.curl';
    -- require 'base.getvar';

    local api = freeswitch.API();
    local adapter_host = api:executeString('global_getvar adapter_host');
    local timeout = request_timeout or 1;

    local global_call_id = event:getHeader('variable_global_call_id') or '';
    local user = event:getHeader('variable_dialed_user') or '';
    local domain = event:getHeader('variable_dialed_domain') or '';
    local event_time_str = event:getHeader('Event-Date-Timestamp') or (tostring(os.time()) .. '000000');

    if domain == 'mock.metechvn.com' then
      local url = 'http://10.196.26.15:3000/call/hangup';
        local res = curl(url, 'post', {}, {
            extension = user,
            domain = domain,
            type = 'HANGUP',
            uuid = channel_uuid,
            globalCallId = global_call_id,
            timeout = 3,
            eventTime = math.floor(tonumber(event_time_str) / 1000)
        }, 2);
  
        freeswitch.consoleLog('DBG', 'Push notification to ' .. url .. ' result ' .. tostring(res or '') .. '\n');
      return;
    end

    local url = adapter_host .. '/agent-events/push';
    local res = curl(url, 'post', {
      user = user,
      domain = domain,
      type = 'CANCEL',
      uuid = channel_uuid,
      globalcallid = global_call_id,
      eventime = math.floor(tonumber(event_time_str) / 1000)
    }, {}, timeout);

    freeswitch.consoleLog('DBG', 'Push notification to ' .. url .. ' result ' .. tostring(res or '') .. '\n');
  end
end

function reset_channel(uuid)
  local sql = "with deleted_calls as ( \
    delete from calls where call_uuid = :uuid or caller_uuid = :uuid \
    returning call_uuid, caller_uuid, callee_uuid \
  ) delete from channels c \
    using deleted_calls d \
    where c.uuid::uuid = d.caller_uuid::uuid \
      or c.uuid::uuid = d.callee_uuid::uuid  \
      or c.call_uuid::text = d.call_uuid::text \
    returning c.uuid, c.call_uuid";

  switch:query(sql, { uuid = uuid }, function (row)
    local call_uuid = row.call_uuid or '';
    local channel_uuid = row.uuid or '';

    if call_uuid ~= '' and channel_uuid ~= '' then
      freeswitch.consoleLog('debug', 'Destroyed channel ' .. channel_uuid .. ' of call ' .. call_uuid .. '\n');
    end
  end);
end

handle_cancel();

reset_channel(channel_uuid);


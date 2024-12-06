local cname = event:getHeader('Channel-Name') or '';
local hup_cause = event:getHeader('Hangup-Cause') or 'NORMAL_CLEARING';

if string.sub(cname, 1, 7) == 'pickup/' and hup_cause ~= 'NORMAL_CLEARING' then
  require 'base.curl';

  local uuid = event:getHeader('Unique-ID');
  local global_call_id = event:getHeader('variable_global_call_id') or '';
  local user = event:getHeader('variable_dialed_user') or '';
  local domain = event:getHeader('variable_dialed_domain') or '';
  local event_time_str = event:getHeader('Event-Date-Timestamp') or (tostring(os.time()) .. '000000');

  local url = 'http://10.196.26.15:3000/call/hangup';
  local res = curl(url, 'post', {}, {
      extension = user,
      domain = domain,
      type = 'HANGUP',
      uuid = uuid,
      globalCallId = global_call_id,
      timeout = 3,
      eventTime = math.floor(tonumber(event_time_str) / 1000)
  }, 2);

  freeswitch.consoleLog('DBG', 'Push notification to ' .. url .. ' result ' .. tostring(res or '') .. '\n');
end

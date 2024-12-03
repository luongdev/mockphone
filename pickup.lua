local cname = event:getHeader('Channel-Name') or '';

if string.len(cname) > 7 and string.sub(cname, 1, 7) == 'pickup/' then
  require 'base.curl';
  require 'base.getvar';
  
  local answer_state = event:getHeader('Answer-State') or '';
  -- local presence_id = event:getHeader('Channel-Presence-ID') or '';
  -- if answer_state ~= 'ringing' or presence_id == '' then return; end
  if answer_state ~= 'ringing' then return; end

  local uuid = event:getHeader('Unique-ID') or '';
  local backend_ip4 = event:getHeader('FreeSWITCH-IPv4') or '';

  local api = freeswitch.API();

  local phone_number = event:getHeader('Caller-ANI') or '';
  local user = getvar(uuid, 'dialed_user', '');
  local domain = getvar(uuid, 'dialed_domain', '');
  local event_time_str = event:getHeader('Event-Date-Timestamp') or (tostring(os.time()) .. '000000');
  local glocal_call_id = getvar(uuid, 'global_call_id', '');
  local leg_timeout = getvar(uuid, 'leg_timeout') or getvar(uuid, 'call_timeout', '10');

  local url = 'http://10.196.26.15:3000/call/incoming';
  local res = curl(url, 'post', {}, {
      extension = user,
      domain = domain,
      type = 'INCOMING',
      timeout = leg_timeout,
      uuid = uuid,
      backend = backend_ip4,
      phoneNumber = phone_number,
      globalCallId = global_call_id,
      eventTime = math.floor(tonumber(event_time_str) / 1000)
  }, 2);

  freeswitch.consoleLog('INFO', 'Push notification to ' .. url .. ' result ' .. tostring(res or '') .. '\n');
end
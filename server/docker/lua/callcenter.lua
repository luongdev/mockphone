local action = event:getHeader("CC-Action") or '';
local uuid = event:getHeader("CC-Member-Session-UUID") or '';
local agent_uuid = event:getHeader('CC-Agent') or '';

if action == '' then
    return ;
end

require 'base.curl';
require 'base.getvar';

local api = freeswitch.API();

function get_millis()
    local handle = io.popen("date +%s%3N")
    local result = handle:read("*a")
    handle:close()

    return result

end

if (action == "agent-offering" and uuid ~= nil) then
    api:executeString('uuid_setvar ' .. uuid .. ' cc_first_offer_uepoch ' .. get_millis());

    if agent_uuid ~= '' then
        local failed_agents = getvar(uuid, 'cc_failed_agents', '');
        if failed_agents == '' then
            api:executeString('uuid_setvar ' .. uuid .. ' cc_failed_agents ' .. agent_uuid);
            return ;
        end

        api:executeString('uuid_setvar ' .. uuid .. ' cc_failed_agents ' .. failed_agents .. '|' .. agent_uuid);
    end
elseif action == "bridge-agent-start" then
    if uuid ~= '' then
        api:executeString('uuid_setvar ' .. uuid .. ' cc_agent_answer_epoch ' .. get_millis());
    end

    local failed_agents = getvar(uuid, 'cc_failed_agents', '');
    if failed_agents ~= '' then
        if string.len(failed_agents) == string.len(agent_uuid) then
            failed_agents = '';
        else
            failed_agents = failed_agents:sub(1, string.len(failed_agents) - string.len('|' .. agent_uuid));
        end

        api:executeString('uuid_setvar ' .. uuid .. ' cc_failed_agents ' .. failed_agents);
        return ;
    end
elseif (action == "member-queue-end") then
    local queue_uuid = event:getHeader('CC-Queue') or '';
    if agent_uuid ~= '' then
        if queue_uuid ~= '' then
            api:executeString('callcenter_config tier set state ' .. queue_uuid .. ' ' .. agent_uuid .. ' Ready');
        end
        api:executeString('callcenter_config agent set state ' .. agent_uuid .. ' Waiting');
    end
end

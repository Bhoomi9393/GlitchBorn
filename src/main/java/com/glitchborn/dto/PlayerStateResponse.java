package com.glitchborn.dto;

import com.glitchborn.model.*;

import java.util.Map;
import java.util.Set;

public class PlayerStateResponse {
    public String playerId;
    public double x;
    public double y;
    public boolean cursorMode;
    public Set<Glitchtype> activeGlitches;
    public Map<ControlKey, Direction> controlMap;

    public static PlayerStateResponse from(Player p) {
        PlayerStateResponse r = new PlayerStateResponse();
        r.playerId = p.getId();
        r.x = p.getX();
        r.y = p.getY();
        r.cursorMode = p.isCursorMode();
        r.activeGlitches = p.getActiveGlitches();
        r.controlMap = p.getControlMap();
        return r;
    }
}

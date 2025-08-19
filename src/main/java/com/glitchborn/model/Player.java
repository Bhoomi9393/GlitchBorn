package com.glitchborn.model;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

public class Player {
    private final String id;

    private double x = 0;
    private double y = 0;
    private double speed = 5.0;

    private boolean cursorMode = false;

    private final EnumMap<ControlKey, Direction> controlMap = new EnumMap<>(ControlKey.class);
    private final EnumMap<Glitchtype, Long> glitchExpiry = new EnumMap<>(Glitchtype.class);

    public Player(String id) {
        this.id = id;
        setDefaultControls();
    }
    
    private void setDefaultControls() {
        controlMap.put(ControlKey.W, Direction.UP);
        controlMap.put(ControlKey.A, Direction.LEFT);
        controlMap.put(ControlKey.S, Direction.DOWN);
        controlMap.put(ControlKey.D, Direction.RIGHT);
    }

    public void scrambleControls() {
        List<Direction> dirs = new ArrayList<>(List.of(Direction.UP, Direction.LEFT,Direction.DOWN, Direction.RIGHT));
        Collections.shuffle(dirs);
        controlMap.put(ControlKey.W, dirs.get(0));
        controlMap.put(ControlKey.A, dirs.get(1));
        controlMap.put(ControlKey.S, dirs.get(2));
        controlMap.put(ControlKey.D, dirs.get(3));
    }

    public void resetControls() {
        setDefaultControls();
    }

    public void applyGlitch(Glitchtype type) {
        long durationMs = 9000;
        long until = System.currentTimeMillis() + durationMs;
        glitchExpiry.put(type, until);

        if (type == Glitchtype.CONTROL_REMAPPING) {
            scrambleControls();
        }
    }

    public void clearGlitch(Glitchtype type) {
        glitchExpiry.remove(type);
        if (type == Glitchtype.CONTROL_REMAPPING) {
            resetControls();
        }
    }

    public boolean isGlitchActive(Glitchtype type) {
        Long until = glitchExpiry.get(type);
        if (until == null) return false;
        if (System.currentTimeMillis() > until) {
            clearGlitch(type);
            return false;
        }
        return true;
    }

    public void tick() {
         List<Glitchtype> toClear = new ArrayList<>();
         long now = System.currentTimeMillis();
         for (Map.Entry<Glitchtype, Long> e : glitchExpiry.entrySet()) {
            if (now > e.getValue()) toClear.add(e.getKey());
         }
         for (Glitchtype t : toClear) clearGlitch(t);
    }

    public void moveByKey(ControlKey key) {
        Direction dir = controlMap.getOrDefault(key, Direction.NONE);
        switch (dir) {
            case UP -> y -= speed;
            case DOWN -> y += speed;
            case LEFT -> x -= speed;
            case RIGHT -> x += speed;
            default -> {}
        }
        maybeTeleport();
    }

    public void moveToCursor (double cursorX, double cursorY) {
        double dx = cursorX - x;
        double dy = cursorY - y;

        if (isGlitchActive(Glitchtype.CURSOR_INVERT)) {
            dx = -dx;
            dy = -dy;
        }
        double len = Math.hypot(dx, dy);
        if (len > 0) {
            x += (dx / len) * speed;
            y += (dy / len) * speed;
        }
        maybeTeleport();
    }

    private void maybeTeleport() {
        if (isGlitchActive(Glitchtype.TELEPORT)) {
            if (ThreadLocalRandom.current().nextDouble() < 0.05) {
                x += ThreadLocalRandom.current().nextDouble(-15, 16);
                y += ThreadLocalRandom.current().nextDouble(-15, 16);
            }
        }
    }

    public String getId() { return id;}
    public double getX() { return x; }
    public double getY() { return y; }
    public double getSpeed() { return speed; }
    public void setSpeed(double speed) { this.speed = speed; }
    public boolean isCursorMode() { return cursorMode; }
    public void setCursorMode(boolean cursorMode) { this.cursorMode = cursorMode; }

    public Map<ControlKey, Direction> getControlMap() {
        return Collections.unmodifiableMap(controlMap);
    }

    public Set<Glitchtype> getActiveGlitches() {
        tick();
        return Collections.unmodifiableSet(glitchExpiry.keySet());
    }
}



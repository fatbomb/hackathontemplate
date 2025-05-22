"use client";
import { scaleBodies, unscaleBodies } from "@/utils/scaling";
import Matter, { Body, Composite, Engine, Render, Runner, World } from "matter-js";
import { useEffect, useRef, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";
import { Button } from "../ui/button";
import { Play, RotateCcw } from "lucide-react";

type SimulatorProps = {
    bodies: Body[];
    width: number;
    height: number;
    callback: Function;
};

type UpdatedBody = {
    id: string;
    label: string;
    position: { x: number; y: number };
    angle: number;
    velocity: { x: number; y: number };
    angularVelocity: number;
}

export default function Simulator({
    bodies,
    width,
    height,
    callback
}: SimulatorProps) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ contentWidth: width, contentHeight: height });
    const [isRunning, setIsRunning] = useState(false);
    const [bodyUpdates, setBodyUpdates] = useState<UpdatedBody[]>([]);
    let initialBodyDetails = bodies.map((body) => ({
        id: String(body.id),
        label: body.label,
        position: { x: body.position.x, y: body.position.y },
        angle: body.angle,
        velocity: { x: body.velocity.x, y: body.velocity.y },
        angularVelocity: body.angularVelocity,
    }));


    const engineRef = useRef<Engine | null>(null);
    const renderRef = useRef<Render | null>(null);
    const runnerRef = useRef<Runner | null>(null);

    useEffect(() => {
        initialBodyDetails = bodies.map((body) => ({
            id: String(body.id),
            label: body.label,
            position: { x: body.position.x, y: body.position.y },
            angle: body.angle,
            velocity: { x: body.velocity.x, y: body.velocity.y },
            angularVelocity: body.angularVelocity,
        }));

        const scene = sceneRef.current;
        if (!scene) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width: containerWidth, height: containerHeight } = entry.contentRect;

                const targetAspect = width / height;
                const containerAspect = containerWidth / containerHeight;

                let contentWidth: number;
                let contentHeight: number;

                if (containerAspect > targetAspect) {
                    contentHeight = containerHeight;
                    contentWidth = Math.round(containerHeight * targetAspect);
                } else {
                    contentWidth = containerWidth;
                    contentHeight = Math.round(containerWidth / targetAspect);
                }

                setDimensions({ contentWidth, contentHeight });
            }
        });

        observer.observe(document.querySelector("#scene")!);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const { contentWidth, contentHeight } = dimensions;
        const scene = sceneRef.current;
        if (!scene || contentWidth === 0 || contentHeight === 0) return;

        const engine = Engine.create();
        const computedStyle = getComputedStyle(document.documentElement);
        const bgPrimary = computedStyle.getPropertyValue('--background').trim() || "#fff";

        const collisionListener = (event: Matter.IEventCollision<Matter.Engine>) => {
            event.pairs.forEach((pair: {
            bodyA: Body;
            bodyB: Body;
            }) => {
            const { bodyA, bodyB } = pair;
            if (bodyA.label === "Projectile" && bodyB.label === "Destination") {
                Matter.Events.off(engine, "collisionStart", collisionListener);
                callback(bodyA, bodyB);
            }
            });
        };

        Matter.Events.on(engine, "collisionStart", collisionListener);

        const render = Render.create({
            element: scene,
            engine,
            options: {
                width: contentWidth,
                height: contentHeight,
                wireframes: false,
                background: bgPrimary,
            },
        });

        const runner = Runner.create();
        Composite.add(engine.world, bodies);
        const bodies_current = Composite.allBodies(engine.world);

        const updatedBodies = bodies_current.map((body) => {
            return {
                id: String(body.id),
                label: body.label,
                position: body.position,
                angle: body.angle,
                velocity: body.velocity,
                angularVelocity: body.angularVelocity,
            };
        });
        setBodyUpdates(updatedBodies);

        Render.run(render);

        engineRef.current = engine;
        renderRef.current = render;
        runnerRef.current = runner;

        return () => {
            Render.stop(render);
            Runner.stop(runner);
            World.clear(engine.world, false);
            Engine.clear(engine);
            if (render.canvas.parentNode) {
                render.canvas.parentNode.removeChild(render.canvas);
            }
        };
    }, [dimensions, bodies, width, height]);

    const resetScene = () => {
        setIsRunning(false);
        Runner.stop(runnerRef.current!);
        const engine = engineRef.current;
        if (!engine) return;

        World.clear(engine.world, false);
        bodies.forEach((body) => {
            const initialBody = initialBodyDetails.find((b) => b.id === String(body.id));
            if (initialBody) {
                Body.setPosition(body, initialBody.position);
                Body.setAngle(body, initialBody.angle);
                Body.setVelocity(body, initialBody.velocity);
                Body.setAngularVelocity(body, initialBody.angularVelocity);
            }
        });

        Composite.add(engine.world, bodies);
    };

    const playScene = () => {
        Runner.run(runnerRef.current!, engineRef.current!);
        setIsRunning(true);
    }

    useEffect(() => {
        const getBodyUpdates = () => {
            const engine = engineRef.current;
            if (!engine) return;
            const bodies_current = Composite.allBodies(engine.world);
            const unscaledBodies = unscaleBodies(bodies_current, dimensions, { width, height });
            const updatedBodies = unscaledBodies.map((body) => ({
                id: String(body.id),
                label: body.label,
                position: body.position,
                angle: body.angle,
                velocity: body.velocity,
                angularVelocity: body.angularVelocity,
            }));
            setBodyUpdates(updatedBodies);
        };

        const intervalId = setInterval(() => {
            getBodyUpdates();
        }, 200);

        const timeoutId = setTimeout(() => {
            if(isRunning) {
                Runner.stop(runnerRef.current!);
            }
            clearInterval(intervalId);
        }, 3000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [isRunning]);


    return (
        <div className="flex gap-2">
            <div className="flex flex-col items-center w-fit justify-center p-4">
                <div
                    id="scene"
                    ref={sceneRef}
                    style={{ width: "50dvw", height: "50dvh" }}
                    className="flex flex-col-reverse border bg-muted shadow-lg p-2 px-2"
                >
                    <div className="flex flex-grow gap-2 items-center justify-center">
                        {!isRunning
                            ? <Button variant={"destructive"} onClick={playScene} className="transition duration-200 animate-out"><Play /></Button>
                            : <Button variant={"outline"} onClick={resetScene} className="transition duration-200 animate-in"><RotateCcw /></Button>
                        }
                    </div>
                </div>
            </div>
            <div className="w-80 h-[60vh] overflow-y-auto border rounded-xl bg-gradient-to-br from-background via-primary/10 to-primary/20 shadow-2xl p-6 flex flex-col gap-4">
                <h2 className="font-bold text-xl mb-4 text-primary flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Simulation Status
                </h2>
                {bodyUpdates.length === 0 ? (
                    <div className="text-muted-foreground text-sm italic flex-1 flex items-center justify-center">
                        No updates yet.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {bodyUpdates.map((body, idx) => (
                            <div
                                key={idx}
                                className="rounded-lg bg-card/90 border border-border/70 p-4 shadow transition hover:shadow-lg"
                            >
                                <div className="font-semibold text-primary mb-3 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                                    {body.label || body.id}
                                </div>
                                <div className="grid grid-cols-1 gap-y-2 text-sm">
                                    <div className="flex items-center">
                                        <span className="w-28 font-medium text-muted-foreground">Position:</span>
                                        <span className="ml-2 font-mono text-primary flex gap-2">
                                            <span className="inline-block w-20 text-right">x={body.position.x.toFixed(2)}</span>
                                            <span className="inline-block w-20 text-right">y={body.position.y.toFixed(2)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-28 font-medium text-muted-foreground">Angle:</span>
                                        <span className="ml-2 font-mono text-primary">
                                            {body.angle.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-28 font-medium text-muted-foreground">Velocity:</span>
                                        <span className="ml-2 font-mono text-primary flex gap-2">
                                            <span className="inline-block w-20 text-right">x={body.velocity.x.toFixed(2)}</span>
                                            <span className="inline-block w-20 text-right">y={body.velocity.y.toFixed(2)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-28 font-medium text-muted-foreground">Angular Vel.:</span>
                                        <span className="ml-2 font-mono text-primary">
                                            {body.angularVelocity.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
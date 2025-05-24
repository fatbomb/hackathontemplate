"use client";
import { unscaleBodies } from "@/utils/scaling";
import Matter, { Body, Composite, Engine, Render, Runner, World } from "matter-js";
import { useEffect, useRef, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";
import { Button } from "../ui/button";
import { Play, RotateCcw } from "lucide-react";

type SimulatorProps = {
    bodies: Body[];
    width: number;
    height: number;
    callback: (bodyA: Body, bodyB: Body) => void;
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
            for (const entry of entries) {
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
            <div className="flex flex-col justify-center items-center p-4 w-fit">
                <div
                    id="scene"
                    ref={sceneRef}
                    style={{ width: "50dvw", height: "50dvh" }}
                    className="flex flex-col-reverse bg-muted shadow-lg p-2 px-2 border"
                >
                    <div className="flex flex-grow justify-center items-center gap-2">
                        {!isRunning
                            ? <Button variant={"destructive"} onClick={playScene} className="transition animate-out duration-200"><Play /></Button>
                            : <Button variant={"outline"} onClick={resetScene} className="transition animate-in duration-200"><RotateCcw /></Button>
                        }
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 bg-gradient-to-br from-background via-primary/10 to-primary/20 shadow-2xl p-6 border rounded-xl w-80 h-[60vh] overflow-y-auto">
                <h2 className="flex items-center gap-2 mb-4 font-bold text-primary text-xl">
                    <span className="inline-block bg-green-500 rounded-full w-2 h-2 animate-pulse"></span>
                    Simulation Status
                </h2>
                {bodyUpdates.length === 0 ? (
                    <div className="flex flex-1 justify-center items-center text-muted-foreground text-sm italic">
                        No updates yet.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {bodyUpdates.map((body, idx) => (
                            <div
                                key={idx}
                                className="bg-card/90 shadow hover:shadow-lg p-4 border border-border/70 rounded-lg transition"
                            >
                                <div className="flex items-center gap-2 mb-3 font-semibold text-primary">
                                    <span className="inline-block bg-blue-400 rounded-full w-2 h-2"></span>
                                    {body.label || body.id}
                                </div>
                                <div className="gap-y-2 grid grid-cols-1 text-sm">
                                    <div className="flex items-center">
                                        <span className="w-28 font-medium text-muted-foreground">Position:</span>
                                        <span className="flex gap-2 ml-2 font-mono text-primary">
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
                                        <span className="flex gap-2 ml-2 font-mono text-primary">
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
"use client";

import Simulator from "@/components/interactive/simulator";
import { Bodies, Body } from "matter-js";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function ProjectileAssets(velX: number, velY: number) {
    const radius = 3;
    const friction = 100;
    const floorHeight = 1;

    const projectile = Bodies.circle(30, 200 - radius - floorHeight, radius, {
        restitution: 0,
        friction,
        render: {
            fillStyle: "#ff0000",
        },
    });
    projectile.label = "Projectile";

    const destination = Bodies.circle(450, 200 - radius - floorHeight, radius, {
        restitution: 0,
        friction,
        render: {
            fillStyle: "#00ff00",
        },
    });
    destination.label = "Destination";

    const ground = Bodies.rectangle(250, 200, 50000, floorHeight, {
        isStatic: true,
        restitution: 0,
        friction,
        density: 1000,
        render: {
            fillStyle: "#0000ff",
        },
    });
    ground.label = "Ground";

    Body.setVelocity(projectile, {
        x: velX,
        y: velY,
    });

    return [projectile, destination, ground];
}

export default function Projectile() {
    const [velX, setVelX] = useState(3);
    const [velY, setVelY] = useState(-3);
    const [bodies, setBodies] = useState<Body[]>(ProjectileAssets(velX, velY));
    const [done, setDone] = useState(false);

    const callback = (bodyA: Body, bodyB: Body) => {
        // if (done) return;
        // setDone(true);
        if(bodyA.label === "Projectile" && bodyB.label === "Destination") {
            console.log("Hit!");
        }
        else{
            console.log("Miss!");
        }
    }

    useEffect(() => {
        const handleVelocityChange = () => {
            setBodies(ProjectileAssets(velX, velY));
        };
        handleVelocityChange();
    }, [velX, velY]);

    return (
        <div className="flex flex-col gap-6 mx-auto my-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Projectile Motion - Basic 01</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">
                        The <span className="text-red-500 font-semibold">red ball</span> is at x = 30 and the <span className="text-green-600 font-semibold">green ball</span> is at x = 450. 
                        Adjust the velocity to make the red ball hit the green ball. The ball must hit the green ball before it hits the ground.
                    </p>
                </CardContent>
            </Card>
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Card className="w-full md:w-1/3">
                    <CardHeader>
                        <CardTitle className="text-base">Projectile Velocity Editor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="velX" className="">Velocity X:</label>
                                <input
                                    type="number"
                                    id="velX"
                                    value={velX}
                                    min={-1000}
                                    onChange={(e) => setVelX(parseFloat(e.target.value))}
                                    className="border border-gray-300 rounded p-1 w-24"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="velY" className="">Velocity Y:</label>
                                <input
                                    type="number"
                                    id="velY"
                                    min={-1000}
                                    value={velY}
                                    onChange={(e) => setVelY(parseFloat(e.target.value))}
                                    className="border border-gray-300 rounded p-1 w-24"
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <div className="flex-1 flex justify-center items-center">
                    <div className="bg-gray-100 rounded shadow p-2">
                        <Simulator callback={callback} bodies={bodies} width={500} height={200} />
                    </div>
                </div>
            </div>
        </div>
    );
}
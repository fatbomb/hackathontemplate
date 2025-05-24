"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";

export default function PointsStat({ points, title }: { points: {
    points: number;
    level: number;
}, title: string }) {

    const [pointsState, setPointsState] = useState(points);

    useEffect(() => {
        function fetchPoints() {
          const pts = localStorage.getItem('projectile_points') || "0";
          const lvl = localStorage.getItem('projectile_level') || "0";
          setPointsState({
            points: parseInt(pts),
            level: parseInt(lvl)
          })
        }

        const interval = setInterval(fetchPoints, 1000);

        fetchPoints();

        return () => {
          clearInterval(interval);
        }
    }, []);

    return <Card className="border border-muted-foreground shadow-lg w-full">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-primary-foreground/80">Track your progress through the challenges</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{pointsState.points}</div>
                <div className="text-xs uppercase tracking-wide mt-1">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{pointsState.level}</div>
                <div className="text-xs uppercase tracking-wide mt-1">Current Level</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
}
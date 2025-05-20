// import VerticesAndEdges from "@/markdown/subjects/mathematics/combinatorics/graph-theory/01-vertices-and-edges.md";
import RichTextStyle from "@/styles/richTextStyle.module.css";
import IamGroot from "./markdown/kk.md";
// import Interactive from "../../../physics/projectile/interactive";

export default function GraphTheory(){
    return (
        <div className="flex w-screen items-start gap-2 justify-between">
            <div className={` w-1/2 ${RichTextStyle.richtext}`}>
                <IamGroot />
            </div>
            <div className="w-1/2">
                {/* <Interactive /> */}
            </div>
        </div>
    );
}
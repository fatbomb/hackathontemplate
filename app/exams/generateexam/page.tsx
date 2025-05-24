import MCQGenerationForm from "@/components/MCQGenerationform";
import { getCurrentUser } from "@/lib/getUser";

export default async function GenerateExamPage() {
    const user = await getCurrentUser();

  return (
    <main className="bg-gray-50 p-8 min-h-screen">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-3xl text-center">MCQ Question Generator</h1>
        <MCQGenerationForm
          user={user} collectionId={""} collectionName={""} id={""} />
      </div>
    </main>
  );
}
import { InterviewList } from "@/components/InterviewList";
import build from "@/content/interview-data/ai";

export default function Page() {
  return <InterviewList locale="en" {...build("en")} />;
}

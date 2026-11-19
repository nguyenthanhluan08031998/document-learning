import { InterviewList } from "@/components/InterviewList";
import build from "@/content/interview-data/browser-flow";

export default function Page() {
  return <InterviewList locale="en" {...build("en")} />;
}

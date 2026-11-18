import { InterviewList } from "@/components/InterviewList";
import build from "@/content/interview-data/cicd";

export default function Page() {
  return <InterviewList locale="vi" {...build("vi")} />;
}

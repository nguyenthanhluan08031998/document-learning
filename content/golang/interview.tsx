import { InterviewList } from "@/components/InterviewList";
import build from "@/content/interview-data/go";

export default function Page() {
  return <InterviewList locale="vi" {...build("vi")} />;
}

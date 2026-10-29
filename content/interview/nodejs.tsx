import { InterviewList } from "@/components/InterviewList";
import build from "@/content/interview-data/nodejs";

export default function Page() {
  return <InterviewList locale="vi" {...build("vi")} />;
}

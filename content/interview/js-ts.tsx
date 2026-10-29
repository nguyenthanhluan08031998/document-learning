import { InterviewList } from "@/components/InterviewList";
import build from "@/content/interview-data/js-ts";

export default function Page() {
  return <InterviewList locale="vi" {...build("vi")} />;
}

import { useParams } from "react-router-dom";
import RichNoteEditor from "../src/components/RichNoteEditor";

export default function NotePage() {
  const { id } = useParams();
  if (!id) return null;
  return <RichNoteEditor id={id} />;
}

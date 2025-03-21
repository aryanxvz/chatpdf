import Balancer from "react-wrap-balancer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Message } from "ai/react";
import ReactMarkdown from "react-markdown";
import { formattedText } from "@/lib/utils";
import { cn } from "@/lib/utils";

const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

interface ChatLineProps extends Partial<Message> {
  sources: string[];
}

export function ChatLine({
  role = "assistant",
  content,
  sources,
}: ChatLineProps) {
  if (!content) {
    return null;
  }
  const formattedMessage = convertNewLines(content);
  const isUser = role !== "assistant";

  return (
    <div className={cn(
      "mb-4 flex",
      isUser ? "justify-end" : "justify-start"
    )}>
      <Card className={cn(
        "max-w-3xl",
        isUser ? "ml-12 dark:bg-[#3697F0] bg-blue-50" : "mr-12 bg-gray-50 dark:bg-[#262626]"
      )}>
        <CardHeader className="py-2 px-4">
          <CardTitle
            className={cn(
              "text-base font-semibold",
              isUser ? "text-amber-500 dark:text-amber-300" : "text-blue-600 dark:text-blue-300"
            )}
          >
            {isUser ? "You" : "AI"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 pl-4 pr-8 text-sm">
          <div className="text-gray-900 dark:text-white">
            {formattedMessage}
          </div>
        </CardContent>
        {sources && sources.length > 0 && (
          <CardFooter className="py-2 px-4">
            <CardDescription className="w-full">
              <Accordion type="single" collapsible className="w-full">
                {sources.map((source, index) => (
                  <AccordionItem value={`source-${index}`} key={index}>
                    <AccordionTrigger>{`Source ${index + 1}`}</AccordionTrigger>
                    <AccordionContent>
                      <ReactMarkdown>{formattedText(source)}</ReactMarkdown>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardDescription>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
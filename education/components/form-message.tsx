export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export async function FormMessage({ 
  message 
}: { 
  message: Message | Promise<Message> 
}) {
  // Await the message if it's a promise
  const resolvedMessage = await message;

  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in resolvedMessage && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {resolvedMessage.success}
        </div>
      )}
      {"error" in resolvedMessage && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {resolvedMessage.error}
        </div>
      )}
      {"message" in resolvedMessage && (
        <div className="text-foreground border-l-2 px-4">{resolvedMessage.message}</div>
      )}
    </div>
  );
}
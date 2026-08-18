import { H1, Stack, Text } from "cursor/canvas";

export default function HelloCanvas() {
  return (
    <Stack gap={8}>
      <H1>canvas-pdf</H1>
      <Text>If this page printed, the CLI is working.</Text>
    </Stack>
  );
}

import { Box, Text } from "ink";
import type { ReactElement } from "react";

export function Output({
  data,
  error = false,
}: {
  data: string;
  error?: boolean;
}): ReactElement {
  return (
    <Box>
      <Text color={error ? "red" : undefined}>{data}</Text>
    </Box>
  );
}

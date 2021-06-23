import { DateTime } from "luxon";
import React from "react";

export const DateTimeLabel = ({
  date,
  ...props
}: { date: string } & JSX.IntrinsicElements["span"]) => {
  return (
    <time dateTime={date} suppressHydrationWarning {...props}>
      {DateTime.fromISO(date).toFormat("yyyy/MM/dd HH:mm ZZ")}
    </time>
  );
};

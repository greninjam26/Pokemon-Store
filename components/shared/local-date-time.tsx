"use client";

import { useEffect, useState } from "react";

type LocalDateTimeProps = Readonly<{
	value: string;
}>;

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "short",
});

function LocalDateTime({ value }: LocalDateTimeProps) {
	const [formattedDate, setFormattedDate] = useState("");

	useEffect(() => {
		setFormattedDate(dateTimeFormatter.format(new Date(value)));
	}, [value]);

	return (
		<time dateTime={value} className="whitespace-nowrap">
			{formattedDate || "Loading..."}
		</time>
	);
}

export default LocalDateTime;

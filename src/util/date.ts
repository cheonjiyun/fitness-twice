export const conversionSqlDateType = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate();

    return `${year}-${month}-${day}`;
};

export const conversionSqlDateTimeType = (date: Date, hour: number, minute: number) => {
    const newDate = conversionSqlDateType(date);

    const newHour = hour.toString().padStart(2, "0");
    const newMinute = minute.toString().padStart(2, "0");

    return `${newDate} ${newHour}:${newMinute}`;
};

// 2024-10-10 16:52
export const getTimeFromSqlDateTime = (dateTime: string) => {
    return dateTime.slice(-5);
};

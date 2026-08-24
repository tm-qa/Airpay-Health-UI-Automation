export function ageToDob(age: number): string {
    const today = new Date();
    const dob = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(dob.getDate())}/${pad(dob.getMonth() + 1)}/${dob.getFullYear()}`;
}

export function dobToPickerTitle(dob: string): string {
    const [day, month, year] = dob.split("/");
    return `${year}-${month}-${day}`;
}

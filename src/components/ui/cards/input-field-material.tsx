import React from 'react'

type InputFieldMaterialProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    placeholder: string;
    type: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputFieldMaterial({
    label,
    placeholder,
    type,
    value,
    onChange,
    ...props
}: Readonly<InputFieldMaterialProps>) {
    return (
        <div className="flex m-8 flex-col gap-2 rounded-md border border-white rounded-md p-2">
            <label className="text-sm font-semibold text-white" htmlFor={label}>
                {label}
            </label>
            <input
                className="p-2 bg-transparent border border-white rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                id={label}
                name={label}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    );
}
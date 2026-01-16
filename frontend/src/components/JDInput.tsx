import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface FormData {
    jdText: string;
}

interface Props {
    register: UseFormRegister<FormData>;
    errors: FieldErrors<FormData>;
}

export default function JDInput({ register, errors }: Props) {
    return (
        <div>
            <textarea
                {...register('jdText', {
                    required: 'Job description is required',
                    minLength: {
                        value: 50,
                        message: 'Job description must be at least 50 characters'
                    }
                })}
                placeholder="Paste the full job description here...

Example:
We're looking for a Senior Full-Stack Developer with 5+ years of experience in React, Node.js, and PostgreSQL. Must have expertise in TypeScript, REST APIs, and CI/CD pipelines. Experience with AWS, Docker, and microservices architecture is preferred..."
                className="input-field resize-none h-64"
            />

            {errors.jdText && (
                <p className="text-red-500 text-sm mt-2">{errors.jdText.message}</p>
            )}

            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span>Paste the complete job description including responsibilities and requirements</span>
                <span className="text-xs">Min. 50 characters</span>
            </div>
        </div>
    );
}

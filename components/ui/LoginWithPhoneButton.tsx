import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface Props {
    setLoginType: React.Dispatch<React.SetStateAction<'email' | 'phone'>>;
    type: 'phone' | 'email';
}

export default function LoginWithPhoneOrEmailButton({ setLoginType, type = 'email' }: Props) {
    return (
        <button
            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
            onClick={() => setLoginType((prev) => (prev === 'phone' ? 'email' : 'phone'))}
        >
            {type === 'email' ? (
                <PhoneIcon className="h-5 w-5 text-gray-900" />
            ) : (
                <EnvelopeIcon className="h-5 w-5 text-gray-900" />
            )}
            <div className="ml-2">{type === 'email' ? 'Phone' : 'Email'}</div>
        </button>
    );
}

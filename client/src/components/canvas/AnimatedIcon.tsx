interface AnimatedIconProps {
    iconType: string;
    color: string; 
}

export const AnimatedIcon = ({ iconType, color }: AnimatedIconProps) => {
    switch (iconType) {
        case 'circle':
            return <circle r="5" fill={color} />;
        case 'box':
            return <rect x="-5" y="-5" width="10" height="10" fill={color} />;
        case 'packet':
            return <rect x="-6" y="-4" width="12" height="8" rx="2" fill={color} />;
        case 'flame':
            return <path d="M-6,5 C-6,5 -2,-5 0, -8 C2,-5 6,5 6,5 L-6,5 Z" fill={color} />;
        case 'star':
            return <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" fill={color} />;
        case 'heart':
            return <path d="M0,-4 C-4,-8 -8,0 0,5 C8,0 4,-8 0,-4 Z" fill={color} />;
        default:
            return null;
    }
}
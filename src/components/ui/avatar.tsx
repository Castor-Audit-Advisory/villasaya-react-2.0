// Material UI Avatar wrapper
import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';

export type AvatarProps = MuiAvatarProps;

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ children, ...props }, ref) => {
    return (
      <MuiAvatar ref={ref} {...props}>
        {children}
      </MuiAvatar>
    );
  }
);

Avatar.displayName = 'Avatar';

export const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';

export const AvatarImage = ({ src, alt }: { src: string; alt?: string }) => {
  return <img src={src} alt={alt} style={{ width: '100%', height: '100%' }} />;
};

/// <reference types="react-scripts" />

// Module declarations for components
declare module './components/UploadForm' {
    import { UploadFormProps } from './types';
    import React from 'react';
    
    const UploadForm: React.FC<UploadFormProps>;
    export default UploadForm;
} 
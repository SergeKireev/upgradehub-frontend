import React from "react"
import { Result } from 'antd';

interface ErrorContentProps {
    error: string
}

export const ErrorContent = (props: ErrorContentProps) => {
    return <Result
        status="warning"
        title={props.error}
    />
}
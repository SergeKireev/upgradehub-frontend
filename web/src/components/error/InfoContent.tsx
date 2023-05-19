import React from "react"
import { Button, Result } from 'antd';

interface ErrorContentProps {
    info: string,
}

export const InfoContent = (props: ErrorContentProps) => {
    return <Result
        status="info"
        title={props.info}
    />
}
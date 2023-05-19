import { ApiName, fetchFiles } from 'ethereum-sources-downloader';
import React, { useEffect, useState } from 'react'
import { parseDiff, Diff, Decoration } from 'react-diff-view';
import { ExpandableHunk, HunkObject } from './hunk/ExpandableHunk';
import { RegularHunk } from './hunk/RegularHunk';

const trimFilePath = (filePath: string) => {
    const fragments = filePath.split('/')
    return fragments.slice(3).join('/')
}

interface DiffRenderProps {
    address: string,
    network: string,
    diff?: string,
}

async function fetchNewCode(
    network: string,
    address: string,
    setNewCode: (codeFetchResult: any) => void) {
    /**
     * Everything should be fine since we have already check the source 
     * has verified code and is not a proxy
     */
    const response = await fetchFiles(network as ApiName, address);
    setNewCode(response);
}

function buildHunk(hunk: HunkObject, fileLines?: string[], isLast?: boolean) {
    if (fileLines) {
        return <ExpandableHunk
            key={hunk.content}
            hunk={hunk}
            fileLines={fileLines}
            isLast={isLast}
        />
    } else {
        return <RegularHunk hunk={hunk} isLast={isLast}/>
    }
}

function findLinesInCodeResult(newCode: any, fileName: string) {
    const emptyNewCode = {
        files: {}
    }
    const fileContent = (newCode || emptyNewCode).files[fileName]
    const fileLines = fileContent?.split('\n')
    return fileLines;
}

export function DiffRender(props: DiffRenderProps) {
    const diffText = props.diff
    const [newCode, setNewCode] = useState(undefined);
    useEffect(() => {
        fetchNewCode(props.network, props.address, setNewCode);
    }, [setNewCode])

    const files = parseDiff(diffText);
    //Leave error.md only if it is the only file
    const filesWithoutError = files.length > 1 ? files.filter(f => !f.newPath.includes('error.md')) : files

    const renderFile = ({ newPath, oldRevision, newRevision, type, hunks }) => (
        <div className='file_change'>
            <div className='file_header'>{trimFilePath(newPath)}</div>
            <Diff key={oldRevision + '-' + newRevision} viewType="split" diffType={type} hunks={hunks}>
                {
                    hunks => {
                        return hunks.map(
                            (hunk, i) => ([
                                <Decoration key={`${hunk.content}-decoration`}>
                                    <div className='hunk-header'>
                                        {`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`}
                                    </div>
                                </Decoration>,
                                buildHunk(hunk,
                                    findLinesInCodeResult(
                                        newCode,
                                        trimFilePath(newPath)
                                    ),
                                    i === hunks.length - 1)
                            ])
                        ).flat()
                    }
                }
            </Diff>
        </div>
    );

    return (
        <>
            {filesWithoutError.map(renderFile)}
        </>
    );
};
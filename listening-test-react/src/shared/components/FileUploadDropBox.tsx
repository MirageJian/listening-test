import {makeStyles} from "@material-ui/core/styles";
import {Box, createStyles, LinearProgress, Theme, Typography} from "@material-ui/core";
import {observer} from "mobx-react";
import React, {ChangeEvent, DragEvent, PropsWithChildren, useRef, useState} from "react";
import {BasicFileModel} from "../models/BasicTaskModel";
import Axios from "axios";

const useStyles = makeStyles((_: Theme) => createStyles({
  // fileNameEllipsis: {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
  uploadBox: {
    border: '1px dashed rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    cursor: 'pointer',
    textAlign: 'center',
    height: '100%'
  }
}));

export const FileUploadDropBox = observer(function (props: PropsWithChildren<{
  onChange: (fm: BasicFileModel) => void, disabled?: boolean, fileType: 'image' | 'audio' | 'video'
}>) { // fileType will not be used directly
  const {onChange, disabled, fileType} = props;
  const classes = useStyles();
  // Default label
  const fileRef = useRef<HTMLInputElement>();
  // Style of file boxes
  const [isUploading, setIsUploading] = useState(false);
  // Program settings
  const [progress, setProgress] = useState(0);

  // Config what to do when finished
  const onUploadingFinished = () => {
    // Clear file input
    if (fileRef.current) fileRef.current.value = null;
    setIsUploading(false);
    setProgress(0);
  }
  const handleFileUploadDrop = (event: DragEvent<HTMLElement> | ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    let files = (event as ChangeEvent<HTMLInputElement>).target.files;
    // If event is not a File Input Choose
    if (!files) files = (event as DragEvent<HTMLElement>).dataTransfer.files;
    // Avoid empty upload
    if (!files[0] || files[0].type.indexOf(fileType + '/') < 0) return;

    // Start uploading and animation
    setIsUploading(true);
    const formData = new FormData();
    formData.append(fileType + 'File', files[0]);
    // File upload handling
    Axios.post('/api/upload-file', formData, {
      onUploadProgress: (progress) => {
        const percentCompleted = Math.round((progress.loaded * 100) / progress.total)
        setProgress(percentCompleted);
      }
    }).then((res) => {
      onChange({src: res.data, filename: files[0].name} as BasicFileModel);
      // Finishing callback
      onUploadingFinished();
    }, onUploadingFinished)
  }
  const handleFileUploadDragOver = (event: any) => {
    event.dataTransfer.dropEffect = 'copy';
    event.preventDefault();
    event.stopPropagation();
  }

  return <>
    <input type="file" ref={fileRef} onChange={handleFileUploadDrop} hidden={true} accept={fileType + '/*'}/>
    {/*Uploading animation and text box*/}
    {isUploading ? <Box p={2} className={classes.uploadBox}>
      <LinearProgress variant="determinate" value={progress}/>
      <br/>
      <Typography variant="body2" color="textSecondary">Uploading {progress}%</Typography>
    </Box> : <Box p={2} className={classes.uploadBox} onClick={() => fileRef.current.click()}
                  onDragOver={handleFileUploadDragOver} onDrop={handleFileUploadDrop}>
      {props.children}
    </Box>}
  </>
})

export function useFileBoxesFunc(medias: BasicFileModel[], keepPlace?: boolean) {
  const [draggingIndex, setDraggingIndex] = useState<number>();

  const handleDropSwapFiles = (dropIndex: number) => {
    if (draggingIndex === dropIndex) return;
    const temp = medias[dropIndex];
    medias[dropIndex] = {...medias[draggingIndex]};
    medias[draggingIndex] = temp;
    setDraggingIndex(undefined);
  }
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  }
  const handleDragOver = (event: any) => {
    event.dataTransfer.dropEffect = 'move';
    event.preventDefault();
    event.stopPropagation();
  }
  const handleAdd = (newFile: BasicFileModel) => {
    const i = medias.indexOf(null);
    // Fill the blank
    if (i > -1) medias[i] = newFile;
    else medias.push(newFile);
  }
  const handleDelete = (index: number) => {
    if (keepPlace) medias[index] = null;
    else medias.splice(index, 1);
  }

  return {handleDragStart, handleDragOver, handleDropSwapFiles, handleAdd, handleDelete, draggingIndex}
}

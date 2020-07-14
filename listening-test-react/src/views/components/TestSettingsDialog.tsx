import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Checkbox, FormControlLabel, IconButton} from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import {TestSettingsModel} from "../../shared/models/BasicTestModel";
import {useFormik} from "formik";

export default function TestSettingsDialog(props: { settings: TestSettingsModel, onConfirm: (settings: TestSettingsModel) => void }) {
  const [open, setOpen] = React.useState(false);
  const formik = useFormik<TestSettingsModel>({
    initialValues: {isIndividual: false, ...props.settings},
    onSubmit: values => {
      props.onConfirm(values);
      setOpen(false);
    }
  });

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton onClick={handleClickOpen}><Icon>settings</Icon></IconButton>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth>
        <form onSubmit={formik.handleSubmit}>
        <DialogTitle id="form-dialog-title">Test settings</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Settings
          </DialogContentText>
          <FormControlLabel
            control={<Checkbox checked={formik.values.isIndividual} {...formik.getFieldProps('isIndividual')}/>}
            label="Show each question individually"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" type="button">Cancel</Button>
          <Button color="primary" type="submit">Confirm</Button>
        </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
import React, {useContext, useState} from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Grid, Icon,
  IconButton,
  TextField
} from "@material-ui/core";
import {useFormik} from "formik";
import Axios from "axios";
import {minLength, pipeValidator, required} from "../shared/FormikValidator";
import {GlobalDialog} from "../shared/ReactContexts";
import {Md5} from "ts-md5";
import {Alert} from "@material-ui/lab";

export default function SettingsPage() {
  const openDialog = useContext(GlobalDialog);
  const [open, setOpen] = useState<boolean>();
  const [message, setMessage] = useState<string>();

  const formik = useFormik({
    initialValues: {password: '', newPassword: '', confirm: ''},
    onSubmit: values => Axios.put('/api/password', {
      // Hash all of things
      password: Md5.hashStr(values.password),
      newPassword: Md5.hashStr(values.newPassword),
      confirm: Md5.hashStr(values.confirm)
    }).then(() => setOpen(true), (reason) => {
      openDialog(reason.response.data);
    }),
    validate: pipeValidator({
      password: [required(), minLength(6)],
      newPassword: [required(), minLength(6)],
      confirm: [required(), minLength(6), (value, errors, name) => {
        if (value !== formik.values.newPassword) {
          errors[name] = 'Confirm password is not match with password';
          return true;
        }
        return false;
      }]
    })
  });

  return <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <CardHeader title="Update password"/>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Current Password" type="password" variant="outlined"
                           {...formik.getFieldProps('password')}
                           error={!!formik.errors.password} helperText={formik.errors.password}/>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="New Password" type="password" variant="outlined"
                           {...formik.getFieldProps('newPassword')}
                           error={!!formik.errors.newPassword} helperText={formik.errors.newPassword}/>
              </Grid>
              <Grid item xs={12}>

                <TextField fullWidth label="Confirm Password" type="password" variant="outlined"
                           {...formik.getFieldProps('confirm')}
                           error={!!formik.errors.confirm} helperText={formik.errors.confirm}/>
              </Grid>
            </Grid>
            <Collapse in={open}>
              <Alert severity={message ? 'error' : 'success'}
                     action={<IconButton aria-label="close" color="inherit" size="small" onClick={() => {
                       setOpen(false);
                       setMessage(null);
                     }}><Icon fontSize="inherit">close</Icon></IconButton>}>
                {message ? message : 'You have successfully updated your password'}
              </Alert>
            </Collapse>
          </CardContent>
          <CardActions style={{justifyContent: 'flex-end'}}>
            <Button color="primary" type="submit">
              Update
            </Button>
          </CardActions>
        </form>
      </Card>
    </Grid>
    <Grid item xs={12} md={6}>
      <Card>
        <CardHeader title="Other settings"/>
        <CardContent>
          More settings will come soon.
        </CardContent>
        <CardActions style={{justifyContent: 'flex-end'}}>
          {/*<Button color="primary">Upload</Button>*/}
        </CardActions>
      </Card>
    </Grid>
  </Grid>
}

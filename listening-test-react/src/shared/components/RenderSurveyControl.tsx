import {SurveyControlModel} from "../models/SurveyControlModel";
import {SurveyControlType} from "../models/EnumsAndTypes";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from "@material-ui/core";
import React from "react";
import {observer} from "mobx-react";

export function SurveyControlValidate(control: SurveyControlModel): string {
  // Pass description type
  if (control.type === SurveyControlType.description) return null;
  // Required checking
  if (control.required) return control.value ? null : `${control.question} is required. You must answer this question to continue`;
  else return null;
}

export const RenderSurveyControl = observer(function (props: { control: SurveyControlModel }) {
  const {control} = props;
  switch (control.type) {
    case SurveyControlType.text:
      return <TextField fullWidth variant="filled" label={control.question} required={control.required}
                        onChange={event => control.value = event.target.value}/>
    case SurveyControlType.radio:
      return <SurveyRadio control={control}/>
    case SurveyControlType.checkbox:
      return <SurveyCheckbox control={control}/>
    case SurveyControlType.description:
      return <Typography>{control.question}</Typography>
    default:
      return null;
  }
})

const SurveyRadio = observer(function (props: { control: SurveyControlModel }) {
  const {control} = props;

  return <FormControl variant="filled" fullWidth required={control.required}>
    <FormLabel component="legend">{control.question}</FormLabel>
    <RadioGroup row value={control.value} onChange={(event => control.value = event.target.value)}>
      {control.options && control.options.map(o =>
        <FormControlLabel key={o} value={o} control={<Radio/>} label={o}/>
      )}
    </RadioGroup>
  </FormControl>
})

const SurveyCheckbox = observer(function (props: { control: SurveyControlModel }) {
  const {control} = props;

  function handleCheckbox(event) {
    // To array for manipulation
    const values: string[] = control.value ? control.value.split(',') : [];
    if (event.target.checked) values.push(event.target.name)
    else values.splice(values.indexOf(event.target.name), 1);
    // To string for storing value
    control.value = values.toString();
  }

  return <FormControl variant="filled" fullWidth required={control.required}>
    <FormLabel component="legend">{control.question}</FormLabel>
    <FormGroup row>
      {control.options && control.options.map(o =>
        <FormControlLabel key={o} label={o} control={
          <Checkbox name={o} onChange={handleCheckbox}/>
        }/>
      )}
    </FormGroup>
    <FormHelperText/>
  </FormControl>
})


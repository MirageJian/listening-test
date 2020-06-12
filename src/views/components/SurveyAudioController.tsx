import {observer} from "mobx-react";
import React, {useRef, useState} from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Icon from "@material-ui/core/Icon";
import Slider from "@material-ui/core/Slider";
import {AudioFileModel} from "../../shared/models/AudioFileModel";

export const SurveyAudioController = observer(function (props: { audios: AudioFileModel[], audioRef: AudioFileModel }) {
  const {audios, audioRef} = props;

  const [currentTime, setCurrentTime] = useState(0);
  const [refs] = useState(audios.map(() => React.createRef<HTMLAudioElement>()));
  const refAudioRef = useRef<HTMLAudioElement>();

  // Include the reference audio for player controller, make sure they work in the same way
  const includeAudioRef = () => {
    return {allAudio: audioRef ? [...audios, audioRef] : audios, allRefs: audioRef ? [...refs, refAudioRef] : refs}
  }

  const handlePause = () => {
    // Deconstruction for all including reference audio
    const {allAudio, allRefs} = includeAudioRef();
    allAudio.forEach((a, i) => {
      a.isPlaying = false;
      allRefs[i].current.pause();
    });
  }

  const dragSlider = (event, newValue) => {
    const {allRefs} = includeAudioRef();
    // Set all audios time
    allRefs.forEach(r => r.current.currentTime = newValue ? newValue : 0);
  }

  const handleTimeUpdate = () => {
    setCurrentTime(refs[0].current.currentTime);
  }

  const handlePlay = (v) => {
    const {allAudio, allRefs} = includeAudioRef();
    allAudio.forEach((a, i) => {
      // Adjust properties
      a.isPlaying = a === v;
      allRefs[i].current.volume = a === v ? 1 : 0;
      // Play after
      allRefs[i].current.play().then();
    });
  }

  const handleSliderLabelFormat = (num) => {
    return isNaN(num) ? 0 : num.toFixed(0) + 's'
  }

  return (
    <React.Fragment>
      {audios.map((v, i) =>
        <Grid item xs={6} key={v.filename}>
          <audio src={v.src} controls loop ref={refs[i]} style={{display: 'none'}}
                 onTimeUpdate={i === 0 ? handleTimeUpdate : undefined}/>

          <Button variant={v.isPlaying ? 'contained' : 'outlined'} color="primary" size="large"
                  startIcon={<Icon>audiotrack</Icon>}
                  onClick={() => v.isPlaying ? handlePause() : handlePlay(v)}>Audio {i + 1}</Button>
        </Grid>
      )}

      {/*Reference Audio*/}
      {audioRef && <Grid item xs={6}>
        <audio key={audioRef.filename} src={audioRef.src} controls loop ref={refAudioRef} style={{display: 'none'}}/>
        <Button variant={audioRef.isPlaying ? 'contained' : 'outlined'} color="primary" size="large"
                startIcon={<Icon>audiotrack</Icon>}
                onClick={() => audioRef.isPlaying ? handlePause() : handlePlay(audioRef)}>Reference</Button>
      </Grid>}

      <Grid item xs={12}>
        <div style={{padding: '0 8px'}}>
          <Slider aria-labelledby="continuous-slider" defaultValue={0} step={0.1} min={0}
                  max={refs[0].current?.duration} value={currentTime} onChange={dragSlider}
                  valueLabelDisplay="auto" valueLabelFormat={handleSliderLabelFormat}/>
        </div>
      </Grid>
    </React.Fragment>
  )
})

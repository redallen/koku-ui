import { StyleSheet } from '@patternfly/react-styles';
import {
  global_Color_200,
  global_FontSize_xs,
  global_spacer_lg,
  global_spacer_md,
} from '@patternfly/react-tokens';

export const styles = StyleSheet.create({
  chartSkeleton: {
    height: '175px',
    marginBottom: global_spacer_md.value,
    marginTop: global_spacer_md.value,
  },
  container: {
    display: 'flex',
  },
  cost: {
    flexGrow: 1,
    minHeight: '470px',
    marginRight: global_spacer_md.value,
  },
  legendSkeleton: {
    marginTop: global_spacer_md.value,
  },
  reportSummary: {
    height: '100%',
  },
  subtitle: {
    display: 'inline-block',
    fontSize: global_FontSize_xs.value,
    color: global_Color_200.var,
    marginBottom: '0',
  },
  tops: {
    flexGrow: 1,
    marginTop: global_spacer_lg.value,
  },
});

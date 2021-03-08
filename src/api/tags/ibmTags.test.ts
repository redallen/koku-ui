jest.mock('axios');

import axios from 'axios';

import { runTag } from './ibmTags';
import { TagType } from './tag';

test('api run reports calls axios get', () => {
  const query = 'filter[resolution]=daily';
  runTag(TagType.tag, query);
  expect(axios.get).toBeCalledWith(`tags/ibm/?${query}`);
});

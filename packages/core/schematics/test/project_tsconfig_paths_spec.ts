/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {getProjectTsConfigPaths} from '../utils/project_tsconfig_paths';

describe('project tsconfig paths', () => {
  let testTree: UnitTestTree;

  beforeEach(() => {
    testTree = new UnitTestTree(new HostTree());
  });

  it('should detect build tsconfig path inside of angular.json file', async () => {
    testTree.create('/my-custom-config.json', '');
    testTree.create('/angular.json', JSON.stringify({
      version: 1,
      projects: {my_name: {architect: {build: {options: {tsConfig: './my-custom-config.json'}}}}}
    }));

    expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual(['my-custom-config.json']);
  });

  it('should be able to read workspace configuration which is using JSON5 features', async () => {
    testTree.create('/my-build-config.json', '');
    testTree.create('/angular.json', `{
      version: 1,
      // Comments, unquoted properties or trailing commas are only supported in JSON5.
      projects: {
        with_tests: {
          targets: {
            build: {
              options: {
                tsConfig: './my-build-config.json',
              }
            }
          }
        }
      },
    }`);

    expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual(['my-build-config.json']);
  });

  it('should detect test tsconfig path inside of angular.json file', async () => {
    testTree.create('/my-test-config.json', '');
    testTree.create('/angular.json', JSON.stringify({
      version: 1,
      projects: {my_name: {architect: {test: {options: {tsConfig: './my-test-config.json'}}}}}
    }));

    expect((await getProjectTsConfigPaths(testTree)).testPaths).toEqual(['my-test-config.json']);
  });

  it('should detect test tsconfig path inside of .angular.json file', async () => {
    testTree.create('/my-test-config.json', '');
    testTree.create('/.angular.json', JSON.stringify({
      version: 1,
      projects: {with_tests: {architect: {test: {options: {tsConfig: './my-test-config.json'}}}}}
    }));

    expect((await getProjectTsConfigPaths(testTree)).testPaths).toEqual(['my-test-config.json']);
  });

  it('should not return duplicate tsconfig files', async () => {
    testTree.create('/tsconfig.json', '');
    testTree.create('/.angular.json', JSON.stringify({
      version: 1,
      projects: {app: {architect: {build: {options: {tsConfig: 'tsconfig.json'}}}}}
    }));

    expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual(['tsconfig.json']);
  });
});

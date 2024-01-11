# Alteration utils

This directory contains utilities for database alteration scripts.

Due to the nature of alteration, all utility functions should be maintained in an immutable way. This means when a function needs to be changed, a new file should be created with the following name format:

`<timestamp>-<function-or-purpose>.js`

The timestamp should be in the format of epoch time in seconds. The original file should be kept for historical purposes.

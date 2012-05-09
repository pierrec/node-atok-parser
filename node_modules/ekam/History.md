0.0.6 / 2012-04-23
==================

* Windows: use `path.resolve()` to make sure the drive is set
* `ekam --init` checks for existing files. Use `ekam --init --force` to overwrite them

0.0.5 / 2012-03-15
==================

* Fix: support multiple entries for input property
* Windows support

0.0.4 / 2012-03-11
==================

* Added __dirname and __filename when building from a .js file
* Added missing dependency (inherits)

0.0.3 / 2012-03-08
==================

* Fixed if() command matching brackets
* Fixed garbled data in between //if() //else //endif
* Fixes to the command line program ekam
* Added ability to run a build with a Javascript file, including access to ShellJS commands

0.0.2 / 2012-02-23
==================

* Added //else command

0.0.1 / 2012-02-20
==================

* Fixed `uglify()` not working properly
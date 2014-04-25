jquery-wresize
==============
This library is written up at http://owenberesford.me.uk/resource/wresize

Plugin to collapse window resize events.  Please see other readme.

Why are there no unit tests?
I published early... If I get time I will create a set of qunit tests.

In terms of behat or jasmine, because that would require installing software on external machines where I am not admin.  I only //need// unittests for MSIE and Safari.  The testing is checking the JS interpreter more than checking the code,


Code known to run under the following:
* recent FF
* recent Chrome/Chromuim
* general install of MSIE8, MSIE10, MSIE11
* recent Opera

* Mobile safari
* mobile chrome

MSIE is the expensive bit, and has eaten 50% of the consumed cost.
if anyone has a copy of MSIE7 or MSIE9, would they mind running the test pls?


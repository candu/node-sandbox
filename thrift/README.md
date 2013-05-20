## Usage

In one terminal window, run

    $ node server.js

In another, run

    $ node client.js 10 1

You can run multiple clients simultaneously. To run `$M` clients that issue
`$N` add/get pairs each:

    $ for i in $(seq 1 $M); do node client.js $N $i & done

Don't be alarmed by the non-sequential numbers - the sequence

    add(1);
    get();

is not atomic! Instead, check that it's working by verifying that the last
number printed to console is `$N * $M`.

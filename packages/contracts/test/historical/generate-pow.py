#!/usr/bin/env python

from __future__ import division
import os
import math
import re
import sys


def gen_fractional_pow_table_hex(max_n, d):
    table = '0x'

    for n in range(max_n, 1, -1):
        table_value = n**(1/d) * 10**5
        # print(table_value)
        if(n % 9 == 0):
            table += '\n0x'

        hex_value = "{0:0{1}x}".format(int(table_value), 2 * 4)
        table += ''.join(
            hex_value[i: i + 2] for i in range(0, len(hex_value), 2)
        )

    return table


def gen_fractional_pow_table(max_n, d):
    table = '['

    for n in range(0, max_n):
        table_value = math.floor(n**(1/d) * 10**5)
        table += ', ' + str(table_value)
    return table + ']'


def generate_fractional_pow(max_n):

    for d in [1.93, 2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3]:
        print("Generating the fractional_pow() lookup table for", d ,"...")
        # print(gen_fractional_pow_table(max_n, d))
        print(gen_fractional_pow_table_hex(max_n, d))


if __name__ == '__main__':
    max_n = 9
    generate_fractional_pow(max_n)

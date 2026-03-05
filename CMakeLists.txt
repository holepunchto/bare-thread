cmake_minimum_required(VERSION 4.0)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)

project(bare_thread C)

add_bare_module(bare_thread)

target_sources(
  ${bare_thread}
  PRIVATE
    binding.c
)

# KeepKey device Protocol Buffers

These protocol buffers define the protocol that KeepKey follows. It is a superset of [Trezor's protocol](https://github.com/trezor/trezor-common).

# Setup

The set of messages required to support Cosmos are derived from the official Cosmos-SDK library, which is included in this project as a submodule. After cloning the repository, install the required dependencies with:
`git submodule update --init --recursive`
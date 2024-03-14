#include <emscripten.h>

int EMSCRIPTEN_KEEPALIVE multply(int n, int m)
{
   return n*m;
}

int EMSCRIPTEN_KEEPALIVE sum(int n, int m)
{
   return n+m;
}

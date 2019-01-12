#### 0.1.9 (2019-01-12)

##### New Features

* **cli:**
  *  Try load global installed foy if cannot find in local ([216510d2](https://github.com/zaaack/foy/commit/216510d278019d595f772f6b40c3e4b9c5aa6aff))
  *  Search Foyfiles in parent directories ([0bdfc802](https://github.com/zaaack/foy/commit/0bdfc8029931fd03db31f990708574ed5e0f40f4))
* **fs:**
  *  Naming, filter => skip ([cb01de60](https://github.com/zaaack/foy/commit/cb01de609fe04e8d4f51c944358904e68850dcd7))
  *  Add json options for fs.outputJson ([0c60df36](https://github.com/zaaack/foy/commit/0c60df36ea451c044756f91f9b2f763df7ccfc97))
* **exec & task:**  Add log command options ([2f7a782b](https://github.com/zaaack/foy/commit/2f7a782b5ddd2c5e64fbb114a318199855a38aac))

##### Bug Fixes

* **task:**
  *  Add dependency graph loading & dependency sugar ([f98c2d39](https://github.com/zaaack/foy/commit/f98c2d390c2dab9ad125ee1fb5370491b7cc3518))
  *  Make taskManager singleton ([f797af2a](https://github.com/zaaack/foy/commit/f797af2ab8037b6b66baaf600bf66856ead8c38a))
* **exec:**  Fix .env() only return env value when passing one parameter ([52af9510](https://github.com/zaaack/foy/commit/52af9510abb883cd6b457ea787439cc089f2a7a8))
* **util:**  Fix sleep ms ([6511cc11](https://github.com/zaaack/foy/commit/6511cc11bd8f436fd565873ba636e44586ecfdac))

##### Refactors

* **utils:**  Refactor defaults ([71841674](https://github.com/zaaack/foy/commit/718416742f3ac8e2286c250528d51ba6c786f5b5))

#### 0.1.8 (2019-01-10)

##### New Features

* **fs:**
  *  Naming, filter => skip ([cb01de60](https://github.com/zaaack/foy/commit/cb01de609fe04e8d4f51c944358904e68850dcd7))
  *  Add json options for fs.outputJson ([0c60df36](https://github.com/zaaack/foy/commit/0c60df36ea451c044756f91f9b2f763df7ccfc97))
* **exec & task:**  Add log command options ([2f7a782b](https://github.com/zaaack/foy/commit/2f7a782b5ddd2c5e64fbb114a318199855a38aac))
* **cli:**  Search Foyfiles in parent directories ([0bdfc802](https://github.com/zaaack/foy/commit/0bdfc8029931fd03db31f990708574ed5e0f40f4))

#### 0.1.7 (2019-01-09)

##### New Features

* **task:**  Add loading option for each task ([ac5a4222](https://github.com/zaaack/foy/commit/ac5a4222a1a22c14930a9b72761eb8aed9aea8cb))
* **cli:**  add --init ([d2b27fcb](https://github.com/zaaack/foy/commit/d2b27fcb9fb6ce5ac0a3d0e3930131f770ed60a9))

##### Bug Fixes

* **exec:**  Fix .env() only return env value when passing one parameter ([52af9510](https://github.com/zaaack/foy/commit/52af9510abb883cd6b457ea787439cc089f2a7a8))
* **util:**  Fix sleep ms ([6511cc11](https://github.com/zaaack/foy/commit/6511cc11bd8f436fd565873ba636e44586ecfdac))

#### 0.1.6 (2018-12-29)

##### Chores

* **build:**  Update Foyfile ([d52ea2f7](https://github.com/zaaack/foy/commit/d52ea2f760597ee5bc50a7f555f0f58cfdbe03ed))

##### New Features

* **task:**  Add loading option for each task ([ac5a4222](https://github.com/zaaack/foy/commit/ac5a4222a1a22c14930a9b72761eb8aed9aea8cb))
* **cli:**  add --init ([d2b27fcb](https://github.com/zaaack/foy/commit/d2b27fcb9fb6ce5ac0a3d0e3930131f770ed60a9))

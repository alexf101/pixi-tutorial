import { Giraffe } from "../src/giraffe.js";
const allTests = [];
class Test {
    static Result = {
        pass: "passed",
        fail: "failed",
    };
    constructor(name) {
        this.name = name;
        this.output = [];
        allTests.push(this);
    }
    pass() {
        this.result = Test.Result.pass;
    }
    fail() {
        this.result = Test.Result.fail;
    }
    record(val, msgIfFailed) {
        if (val) {
            this.pass();
        } else {
            this.fail();
            this.log(msgIfFailed);
        }
    }
    log(...msg) {
        this.output.push(msg.map((m) => m.toString()).join(" "));
    }
    show() {
        let output = `Test: ${this.name} | Result: ${this.result}`;
        if (this.result !== Test.Result.pass) {
            output += `| Output: ${this.output.join(", ")}`;
        }
        return output;
    }
}
function runTest(name, test) {
    const t = new Test(name);
    try {
        if (test(t)) {
            t.pass();
        } else {
            t.fail();
        }
    } catch (err) {
        console.log(err);
        debugger;
        t.fail();
        t.log("Raised an error:");
        t.log(err.toString());
    }
}
export default function giraffeTest(output) {
    runTest("count generations", (t) => {
        let g = new Giraffe(0);
        for (let i = 0; i < 10; i++) {
            const child = new Giraffe(0);
            child.setParent(g);
            g = child;
        }
        const generations = g.countAncestors();
        t.log("Generations:", generations);
        return generations === 11;
    });
    output.textContent =
        "Test results:\n" + allTests.map((t) => t.show()).join("\n");
    //  output.textContent = "hello world: ";
}

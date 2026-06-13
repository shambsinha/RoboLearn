package com.robolearn.submission.service;

import com.robolearn.problem.entity.CodingProblem;
import com.robolearn.submission.entity.CodeSubmission;
import com.robolearn.problem.entity.TestCase;
import com.robolearn.submission.repository.CodeSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.stream.Collectors;

public interface CodeExecutionEngine {
    CodeSubmission execute(CodeSubmission submission, List<TestCase> testCases, com.robolearn.problem.entity.CodingProblem problem);
}
